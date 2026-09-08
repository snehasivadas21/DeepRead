import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      <Navbar />

      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">

          <div className="mx-auto max-w-4xl">

            <p className="mb-5 text-sm font-semibold uppercase tracking-wider text-gray-500">
              AI-Powered Research
            </p>

            <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
              Read smarter.
              <br />
              Research deeper.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              DeepRead helps you understand research papers,
              analyze documents, ask questions, and discover
              insights using AI.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

              <Link
                href="/register"
                className="rounded-lg bg-black px-7 py-3.5 font-medium text-white hover:bg-gray-800"
              >
                Start Researching
              </Link>

              <Link
                href="#how-it-works"
                className="rounded-lg border px-7 py-3.5 font-medium hover:bg-gray-50"
              >
                See How It Works
              </Link>

            </div>

          </div>

        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="border-b bg-gray-50"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Features
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Everything you need for research
            </h2>

            <p className="mt-4 text-gray-600">
              Bring your sources together and use AI to work
              with them more effectively.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            <FeatureCard
              icon="📚"
              title="Research Workspace"
              description="Create dedicated workspaces for different research projects and keep everything organized."
            />

            <FeatureCard
              icon="📄"
              title="Source-Based AI"
              description="Upload research papers and documents and ask questions based directly on your sources."
            />

            <FeatureCard
              icon="💬"
              title="AI Research Chat"
              description="Interact with your research through natural conversations and quickly find useful insights."
            />

          </div>

        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-b"
      >
        <div className="mx-auto max-w-7xl px-6 py-20">

          <div className="mx-auto max-w-2xl text-center">

            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              From documents to insights
            </h2>

          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">

            <Step
              number="01"
              title="Create a Workspace"
              description="Create a workspace for the research topic you want to explore."
            />

            <Step
              number="02"
              title="Add Your Sources"
              description="Upload research papers, PDFs, and other relevant documents."
            />

            <Step
              number="03"
              title="Ask & Discover"
              description="Chat with your sources and use AI to discover useful insights."
            />

          </div>

        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">

          <h2 className="text-4xl font-bold md:text-5xl">
            Ready to research deeper?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-gray-600">
            Create your first workspace and start exploring
            your research with DeepRead.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-lg bg-black px-7 py-3.5 font-medium text-white hover:bg-gray-800"
          >
            Get Started
          </Link>

        </div>
      </section>

      <Footer />

    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-7">

      <div className="text-3xl">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        {description}
      </p>

    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border font-semibold">
        {number}
      </div>

      <h3 className="mt-5 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-gray-600">
        {description}
      </p>

    </div>
  );
}