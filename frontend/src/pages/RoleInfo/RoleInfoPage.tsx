import { useParams } from 'react-router';

function RoleInfoPage() {
  const { roleId } = useParams();
  return (
    <>
      <div className="">RoleInfoPage {roleId}</div>
    </>
  );
}

export default RoleInfoPage;
