"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { PortfolioData, ThemeConfig } from "@/types/portfolio";
import { saveFullPortfolioDraftAction, updatePortfolioStatusAction } from "@/dashboard/actions";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface EditorContextType {
  portfolio: PortfolioData;
  isDirty: boolean;
  saveStatus: SaveStatus;
  lastSaved: string | null;
  activePanel: string;
  setActivePanel: (panel: string) => void;
  updatePortfolio: (updater: (prev: PortfolioData) => PortfolioData) => void;
  toggleSectionVisibility: (sectionType: string) => void;
  moveSection: (sectionType: string, direction: "up" | "down") => void;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
  changeTemplate: (templateId: string) => void;
  saveDraft: () => Promise<boolean>;
  publishPortfolio: (publish: boolean) => Promise<boolean>;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const EditorProvider: React.FC<{
  initialData: PortfolioData;
  children: React.ReactNode;
}> = ({ initialData, children }) => {
  const [portfolio, setPortfolio] = useState<PortfolioData>(initialData);
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(new Date().toLocaleTimeString());
  const [activePanel, setActivePanel] = useState<string>("sections");

  const updatePortfolio = useCallback((updater: (prev: PortfolioData) => PortfolioData) => {
    setPortfolio((prev) => {
      const updated = updater(prev);
      return { ...updated, updatedAt: new Date().toISOString() };
    });
    setIsDirty(true);
    setSaveStatus("idle");
  }, []);

  // Section Visibility Toggle (CRITICAL RULE: Disabling a section does NOT delete its data)
  const toggleSectionVisibility = useCallback((sectionType: string) => {
    updatePortfolio((prev) => {
      const updatedSections = prev.sections.map((sec) =>
        sec.type === sectionType ? { ...sec, isVisible: !sec.isVisible } : sec
      );
      return { ...prev, sections: updatedSections };
    });
  }, [updatePortfolio]);

  // Section Reordering (Accessible Up / Down controls)
  const moveSection = useCallback((sectionType: string, direction: "up" | "down") => {
    updatePortfolio((prev) => {
      const index = prev.sections.findIndex((s) => s.type === sectionType);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.sections.length) return prev;

      const updated = [...prev.sections];
      const temp = updated[index];
      updated[index] = updated[newIndex];
      updated[newIndex] = temp;

      // Update sort order metadata
      const reordered = updated.map((sec, idx) => ({ ...sec, order: idx }));
      return { ...prev, sections: reordered };
    });
  }, [updatePortfolio]);

  // Theme Customizer
  const updateTheme = useCallback((newTheme: Partial<ThemeConfig>) => {
    updatePortfolio((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...newTheme },
    }));
  }, [updatePortfolio]);

  // Template Switcher (Preserves 100% of user data)
  const changeTemplate = useCallback((templateId: string) => {
    updatePortfolio((prev) => ({
      ...prev,
      templateId,
    }));
  }, [updatePortfolio]);

  // Persist Draft Changes via Server Action
  const saveDraft = useCallback(async (): Promise<boolean> => {
    setSaveStatus("saving");
    try {
      const res = await saveFullPortfolioDraftAction(portfolio);

      if (res.success) {
        setIsDirty(false);
        setSaveStatus("saved");
        setLastSaved(new Date().toLocaleTimeString());
        return true;
      } else {
        setSaveStatus("error");
        return false;
      }
    } catch (err) {
      console.error("Save draft failed:", err);
      setSaveStatus("error");
      return false;
    }
  }, [portfolio]);

  // Debounced Autosave (2000ms delay)
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isDirty, saveDraft]);

  // Publish Control
  const publishPortfolio = useCallback(async (publish: boolean): Promise<boolean> => {
    setSaveStatus("saving");
    try {
      const res = await updatePortfolioStatusAction(portfolio.id, publish);

      if (res.success) {
        updatePortfolio((prev) => ({
          ...prev,
          isPublished: publish,
          status: publish ? "PUBLISHED" : "DRAFT",
        }));
        setIsDirty(false);
        setSaveStatus("saved");
        setLastSaved(new Date().toLocaleTimeString());
        return true;
      }
      setSaveStatus("error");
      return false;
    } catch (err) {
      console.error("Publish action failed:", err);
      setSaveStatus("error");
      return false;
    }
  }, [portfolio.id, updatePortfolio]);

  return (
    <EditorContext.Provider
      value={{
        portfolio,
        isDirty,
        saveStatus,
        lastSaved,
        activePanel,
        setActivePanel,
        updatePortfolio,
        toggleSectionVisibility,
        moveSection,
        updateTheme,
        changeTemplate,
        saveDraft,
        publishPortfolio,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within an EditorProvider");
  return ctx;
};
