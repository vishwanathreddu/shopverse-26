import { Navigate, useParams } from 'react-router-dom';

export function RedirectOrderDetail() {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={`/account/orders/${id}`} replace />;
}
