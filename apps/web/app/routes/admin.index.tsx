import { redirect } from 'react-router';

export function loader() {
  return redirect('/admin/venues');
}

export default function AdminIndex() {
  return null;
}
