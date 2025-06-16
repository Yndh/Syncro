import type { Metadata } from "next";
import { Familjen_Grotesk, Inter } from "next/font/google";
import { ThemeProvider } from "./providers/ThemeProvider";
import "./landing.scss";

const inter = Inter({ subsets: ["latin"] });
const familjenGrotest = Familjen_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Syncro",
  description:
    "our free project management solution. Create projects, invite members, track tasks with subtasks, notes & more. Simplify collaboration now!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={familjenGrotest.className}>
        <ThemeProvider>
          {children}

          <div className="blurCircle"></div>
          <div className="blurCircle"></div>
          <div className="blurCircle"></div>
        </ThemeProvider>
      </body>
    </html>
  );
}
