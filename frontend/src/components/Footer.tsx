import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        <div className="grid gap-8 md:grid-cols-3">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold">
              DeepRead
            </h2>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              An AI-powered research platform that helps you
              understand, explore, and organize your research.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold">
              Product
            </h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500">
              <Link href="#features" className="hover:text-black">
                Features
              </Link>

              <Link href="#how-it-works" className="hover:text-black">
                How It Works
              </Link>

              <Link href="/register" className="hover:text-black">
                Get Started
              </Link>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold">
              Account
            </h3>

            <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500">
              <Link href="/login" className="hover:text-black">
                Login
              </Link>

              <Link href="/register" className="hover:text-black">
                Register
              </Link>
            </div>
          </div>

        </div>

        <div className="mt-10 border-t pt-6 text-sm text-gray-500">
          © {new Date().getFullYear()} DeepRead. All rights reserved.
        </div>

      </div>
    </footer>
  );
}
