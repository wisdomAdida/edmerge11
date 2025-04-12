export const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} EdMerge by Afrimerge. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-primary-500">Help Center</a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary-500">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-primary-500">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
