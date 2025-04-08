
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useThemeContext";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { currentTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(currentTheme === "light" ? "dark" : "light");
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme}>
      {currentTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
