import { TextAdventureGameComponent } from "../components/text-adventure-game";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen p-8 font-[family-name:var(--font-geist-sans)]">
      <main className="flex-grow flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">Prompt Engineering Challenge</h1>
        <TextAdventureGameComponent />
      </main>
      <footer className="mt-8 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/javAlborz/PromptQuest"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span role="img" aria-label="GitHub">📂</span>
          View on GitHub
        </a>
      </footer>
    </div>
  );
}