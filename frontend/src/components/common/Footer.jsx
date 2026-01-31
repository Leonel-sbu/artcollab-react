export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-medium text-gray-800">ARTCOLLAB</div>
          <div> {new Date().getFullYear()} ARTCOLLAB. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
