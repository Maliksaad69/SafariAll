import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { parseTalaData, serializeTalaData } from '@/lib/tala-verification';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 15 * 1024 * 1024; // 15 MB for PDFs and high-res scans
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/jpg',
];

async function resolveOperator(session: { operatorId?: string; userId: string; role: string }, queryOperatorId?: string | null) {
  if (session.role === 'ADMIN' && queryOperatorId) {
    return prisma.operator.findUnique({
      where: { id: queryOperatorId },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });
  }

  if (session.operatorId) {
    return prisma.operator.findUnique({
      where: { id: session.operatorId },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });
  }

  return prisma.operator.findUnique({
    where: { userId: session.userId },
    include: { user: { select: { email: true, firstName: true, lastName: true } } },
  });
}

/**
 * GET: Fetch the current operator's verification status, uploaded TALA document, and owner notes.
 */
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Agency authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryOperatorId = searchParams.get('operatorId');

    const operator = await resolveOperator(session, queryOperatorId);
    if (!operator) {
      return NextResponse.json({ error: 'Operator profile not found.' }, { status: 404 });
    }

    const talaData = parseTalaData(
      operator.serviceSummary,
      operator.registrationNumber,
      operator.licenseDocumentUrl,
      operator.isVerified
    );

    return NextResponse.json({
      success: true,
      operatorId: operator.id,
      companyName: operator.companyName,
      countryOfOrigin: operator.countryOfOrigin,
      isVerified: operator.isVerified,
      verificationDate: operator.verificationDate,
      registrationNumber: operator.registrationNumber,
      licenseDocumentUrl: operator.licenseDocumentUrl,
      talaData,
    });
  } catch (error: any) {
    console.error('Error fetching operator verification status:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}

/**
 * POST: Upload / Import official TALA document and submit for owner verification.
 */
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'OPERATOR' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Agency authentication required.' }, { status: 401 });
    }

    const form = await req.formData();
    const queryOperatorId = form.get('operatorId')?.toString();
    const operator = await resolveOperator(session, queryOperatorId);

    if (!operator) {
      return NextResponse.json({ error: 'Operator profile not found.' }, { status: 404 });
    }

    const file = form.get('file');
    const talaNumber = form.get('talaNumber')?.toString().trim() || '';
    const issuingAuthority = form.get('issuingAuthority')?.toString().trim() || '';
    const expiryDate = form.get('expiryDate')?.toString().trim() || '';
    const operatorNotes = form.get('notes')?.toString().trim() || '';

    let documentUrl = operator.licenseDocumentUrl;
    let documentName = 'TALA_Document';
    let documentMimeType = '';
    let documentSizeBytes = 0;

    // Handle document upload if a new file is attached
    if (file instanceof File && file.size > 0) {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Unsupported file format "${file.type || 'unknown'}". Allowed formats: PDF, JPEG, PNG, WebP.`,
          },
          { status: 415 }
        );
      }

      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          {
            error: `Document "${file.name}" is ${(file.size / 1024 / 1024).toFixed(1)} MB. Maximum allowed size is 15 MB.`,
          },
          { status: 413 }
        );
      }

      const bytes = Buffer.from(await file.arrayBuffer());

      // Save document asset into MediaAsset table (bytea in Postgres)
      const mediaAsset = await prisma.mediaAsset.create({
        data: {
          filename: file.name || `TALA_${operator.slug}.pdf`,
          mimeType: file.type || 'application/pdf',
          sizeBytes: bytes.length,
          data: bytes,
          altText: `Official TALA License for ${operator.companyName}`,
          isCover: false,
        },
        select: { id: true, filename: true, mimeType: true, sizeBytes: true },
      });

      documentUrl = `/api/media/${mediaAsset.id}`;
      documentName = mediaAsset.filename;
      documentMimeType = mediaAsset.mimeType;
      documentSizeBytes = mediaAsset.sizeBytes;
    }

    // Ensure we have a document URL (either newly uploaded or already existing)
    if (!documentUrl) {
      return NextResponse.json(
        { error: 'Please upload an official TALA license document (PDF or scanned image).' },
        { status: 400 }
      );
    }

    const effectiveTalaNumber = talaNumber || operator.registrationNumber;
    if (!effectiveTalaNumber) {
      return NextResponse.json(
        { error: 'TALA License / Registration Number is required.' },
        { status: 400 }
      );
    }

    // Preserve previous owner review notes if any, but reset status to PENDING
    const prevTalaData = parseTalaData(operator.serviceSummary, operator.registrationNumber, operator.licenseDocumentUrl, operator.isVerified);

    const updatedTalaData = {
      talaNumber: effectiveTalaNumber,
      issuingAuthority: issuingAuthority || prevTalaData.issuingAuthority || 'Ministry of Tourism / National Licensing Authority',
      expiryDate: expiryDate || prevTalaData.expiryDate,
      documentUrl,
      documentName: documentName || prevTalaData.documentName || 'TALA_Document',
      documentMimeType: documentMimeType || prevTalaData.documentMimeType || 'application/pdf',
      documentSizeBytes: documentSizeBytes || prevTalaData.documentSizeBytes || 0,
      submittedAt: new Date().toISOString(),
      status: 'PENDING' as const,
      reviewNotes: operatorNotes ? `Operator remarks: ${operatorNotes}` : prevTalaData.reviewNotes,
    };

    const serialized = serializeTalaData(updatedTalaData, operator.serviceSummary);

    const updatedOperator = await prisma.operator.update({
      where: { id: operator.id },
      data: {
        registrationNumber: effectiveTalaNumber,
        licenseDocumentUrl: documentUrl,
        isVerified: false, // Must be re-verified by owner
        verificationDate: null,
        serviceSummary: serialized,
      },
      select: {
        id: true,
        companyName: true,
        registrationNumber: true,
        licenseDocumentUrl: true,
        isVerified: true,
        verificationDate: true,
        serviceSummary: true,
      },
    });

    // Notify admins of new submission
    try {
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'INFO',
            title: 'New TALA Document for Verification',
            body: `Operator "${operator.companyName}" submitted their TALA license (${effectiveTalaNumber}) for owner approval.`,
            link: '/admin',
          },
        });
      }
    } catch (notifErr) {
      console.warn('Could not dispatch admin notification:', notifErr);
    }

    return NextResponse.json({
      success: true,
      message: 'TALA document submitted successfully! It is now in the Website Owner review queue.',
      talaData: updatedTalaData,
      operator: updatedOperator,
    });
  } catch (error: any) {
    console.error('Error submitting TALA verification document:', error);
    return NextResponse.json({ error: error.message || 'Internal server error.' }, { status: 500 });
  }
}
