import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Todo List",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header>
          <nav>
            <h1>Приложение Todo List</h1>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>© 2024 Todo List Приложение</p>
        </footer>
      </body>
    </html>
  );
}
