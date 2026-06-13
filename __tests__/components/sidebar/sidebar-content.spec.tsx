import { searchPromptAction } from "@/app/actions/prompt.actions";
import { SidebarContent, type SidebarContentProps } from "@/components/sidebar/sidebar-content";
import { render, screen, waitFor } from "@/lib/test-utils";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

const pushMock = jest.fn();
const setQueryMock = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: pushMock
  })
}));

jest.mock("nuqs", () => ({
  useQueryState: (key: string) => {
    const [value, setValue] = useState(mockSearchParams.get(key) ?? "");

    const setQuery = (nextValue: string) => {
      setQueryMock(nextValue);
      setValue(nextValue);
    };

    return [value, setQuery] as const;
  }
}));

jest.mock("@/app/actions/prompt.actions", () => ({
  searchPromptAction: jest.fn().mockResolvedValue({ success: true, prompts: [] })
}));

const initialPrompts = [
  { id: "1", title: "Prompt 1", content: "Content 1" },
  { id: "2", title: "Prompt 2", content: "Content 2" }
];

function makeSut({ prompts = initialPrompts }: SidebarContentProps = {} as SidebarContentProps) {
  return render(<SidebarContent prompts={prompts} />);
}

describe("<SidebarContent />", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    pushMock.mockClear();
    mockSearchParams = new URLSearchParams();
    (searchPromptAction as jest.Mock).mockResolvedValue({ success: true, prompts: [] });
  });

  describe("rendering", () => {
    it("should render sidebar expanded by default", () => {
      makeSut();

      const aside = screen.getByRole("complementary");
      const collapseButton = screen.getByRole("button", { name: /minimizar sidebar/i });
      const expandButton = screen.queryByRole("button", { name: /expandir sidebar/i });

      expect(aside).toBeVisible();
      expect(collapseButton).toBeVisible();
      expect(expandButton).not.toBeInTheDocument();
    });

    it("should render new prompt button", () => {
      makeSut();

      expect(screen.getByRole("button", { name: "Novo prompt" })).toBeVisible();
    });

    it("should render a prompt list", () => {
      makeSut();

      expect(screen.getByText(initialPrompts[0].title)).toBeInTheDocument();
      expect(screen.getAllByRole("paragraph")).toHaveLength(initialPrompts.length);
    });

    it("should update list when search input changes", async () => {
      makeSut();
      const text = "AI";
      const searchInput = screen.getByPlaceholderText("Buscar prompts...");

      await user.type(searchInput, text);

      expect(searchInput).toHaveValue(text);
    });
  });

  describe("SidebarContent - Mobile", () => {
    it("must open and close the mobile menu", async () => {
      makeSut();

      const aside = screen.getByRole("complementary");
      expect(aside.className).toContain("-translate-x-full");

      const openButton = screen.getByRole("button", { name: "Abrir menu" });
      await user.click(openButton);
      expect(aside.className).toContain("translate-x-0");

      const closeButton = screen.getByRole("button", { name: "Fechar menu" });
      await user.click(closeButton);
      expect(aside.className).toContain("-translate-x-full");
    });
  });

  describe("collapse/expand", () => {
    it("should collapse when clicking minimize button", async () => {
      makeSut();

      const collapseButton = screen.getByRole("button", { name: /minimizar sidebar/i });

      await user.click(collapseButton);

      const expandButton = screen.queryByRole("button", { name: /expandir sidebar/i });

      expect(expandButton).toBeInTheDocument();
      expect(collapseButton).not.toBeInTheDocument();
    });

    it("should expand when clicking expand button", async () => {
      makeSut();

      await user.click(screen.getByRole("button", { name: /minimizar/i }));
      await user.click(screen.getByRole("button", { name: /expandir/i }));

      expect(screen.getByRole("button", { name: /minimizar/i })).toBeVisible();
    });

    it("should show create new prompt button when it minimized", async () => {
      makeSut();

      const collapseButton = screen.getByRole("button", { name: /minimizar sidebar/i });

      await user.click(collapseButton);

      const newPromptButton = screen.getByRole("button", { name: "Novo prompt" });

      expect(newPromptButton).toBeVisible();
    });

    it("should not show prompt list when it is minimized", async () => {
      makeSut();

      const collapseButton = screen.getByRole("button", { name: /minimizar sidebar/i });

      await user.click(collapseButton);

      const nav = screen.queryByRole("navigation", {
        name: "Lista de prompts"
      });

      expect(nav).not.toBeInTheDocument();
    });
  });

  describe("navigation", () => {
    it("should navigate to /new when clicking new prompt button", async () => {
      makeSut();

      const newPromptButton = screen.getByRole("button", { name: "Novo prompt" });

      await user.click(newPromptButton);

      expect(pushMock).toHaveBeenCalledWith("/new");
    });
  });

  describe("search", () => {
    it("should navigate with search query when typing", async () => {
      makeSut();
      const text = "test query";
      const searchInput = screen.getByPlaceholderText("Buscar prompts...");

      await user.type(searchInput, text);

      expect(setQueryMock).toHaveBeenCalled();
      const lastCall = setQueryMock.mock.calls.at(-1);
      expect(lastCall?.[0]).toBe(text);
    });

    it("should clear search query from URL when input is cleared", async () => {
      makeSut();
      const searchInput = screen.getByPlaceholderText("Buscar prompts...");

      await user.type(searchInput, "test");
      await user.clear(searchInput);

      const lastClearCall = setQueryMock.mock.calls.at(-1);
      expect(lastClearCall?.[0]).toBe("");
    });

    it("should show initial prompts when search action returns no prompts", async () => {
      (searchPromptAction as jest.Mock).mockResolvedValue({ success: false });

      makeSut();

      const searchInput = screen.getByPlaceholderText("Buscar prompts...");
      await user.type(searchInput, "a");

      await waitFor(() => {
        expect(screen.getByText(initialPrompts[0].title)).toBeInTheDocument();
      });
    });

    it("should start search field with search query from URL", async () => {
      const text = "inicial";
      const searchParams = new URLSearchParams(`q=${text}`);
      mockSearchParams = searchParams;
      makeSut();
      const searchInput = screen.getByPlaceholderText("Buscar prompts...");

      await waitFor(() => expect(searchInput).toHaveValue(text));
    });
  });
});
