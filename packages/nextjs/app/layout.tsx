import { Inter as FontSans } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "~~/app/globals.css";
import { cn } from "~~/app/lib/utils";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = getMetadata({
  title: "CrowdFlix",
  description: "Built with Theta Edge Cloud",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
