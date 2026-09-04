import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-gray-600 dark:text-zinc-400">Stranica nije pronadjena.</p>
      <Link to="/" className="mt-4 inline-block text-[#AD45D1] underline">
        Nazad na pocetnu
      </Link>
    </div>
  );
}
