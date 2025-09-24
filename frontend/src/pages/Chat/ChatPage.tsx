import { useParams } from 'react-router';

function ChatPage() {
  const { chatId } = useParams();
  return (
    <>
      <div className="">ChatPage {chatId}</div>
    </>
  );
}

export default ChatPage;
