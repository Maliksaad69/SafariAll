import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, topic, reference, subject, message, hp_trap } = body;

    // Honeypot anti-spam check
    if (hp_trap) {
      // Silently succeed for bots
      return NextResponse.json({ success: true, message: 'Message received.' });
    }

    if (!fullName || !email || !message) {
      return NextResponse.json(
        { error: 'Please provide your name, email, and message.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Log the contact inquiry for customer support review
    console.log('[CONTACT US INQUIRY]', {
      fullName,
      email,
      phone: phone || 'Not provided',
      topic: topic || 'General Inquiry',
      reference: reference || 'None',
      subject: subject || 'No subject',
      messageLength: message.length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out. Our team will review your inquiry and reply within 24 hours.',
    });
  } catch (error) {
    console.error('Contact inquiry error:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry. Please try again.' },
      { status: 500 }
    );
  }
}
