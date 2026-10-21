import { redirect } from 'next/navigation';

// Chats now open from the chat button in the header; keep old links working.
export default function OperatorMessagesPage() {
  redirect('/operator-portal');
}
