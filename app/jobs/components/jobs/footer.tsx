import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between py-3 sm:py-4 gap-3 sm:gap-0 text-xs sm:text-sm text-gray-600">
          <p className="text-center sm:text-left">
            All © copyright reserved by MedFasterrrr
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <Link
              href="/terms"
              className="text-orange-500 hover:text-orange-600 transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/privacy"
              className="text-orange-500 hover:text-orange-600 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
