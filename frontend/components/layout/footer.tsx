export function Footer() {
  return (
    <footer className="border-t bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 HydroWatch. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

