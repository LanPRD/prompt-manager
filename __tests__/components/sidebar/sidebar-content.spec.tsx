import { SidebarContent, type SidebarContentProps } from "@/components/sidebar/sidebar-content";
import { render, screen } from "@/lib/test-utils";
import userEvent from "@testing-library/user-event";

const pushMock = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: pushMock
  }),
  useSearchParams: () => mockSearchParams
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

      expect(pushMock).toHaveBeenCalled();
      const lastCall = pushMock.mock.calls.at(-1);
      const url = new URL(lastCall[0], "http://localhost");
      expect(url.searchParams.get("q")).toBe(text);
    });

    it("should clear search query from URL when input is cleared", async () => {
      makeSut();
      const searchInput = screen.getByPlaceholderText("Buscar prompts...");

      await user.type(searchInput, "test");
      await user.clear(searchInput);

      const lastCall = pushMock.mock.calls.at(-1);
      const url = new URL(lastCall[0], "http://localhost");
      expect(url.searchParams.has("q")).toBe(false);
    });

    it("should start search field with search query from URL", () => {
      const text = "inicial";
      const searchParams = new URLSearchParams(`q=${text}`);
      mockSearchParams = searchParams;
      makeSut();
      const searchInput = screen.getByPlaceholderText("Buscar prompts...");

      expect(searchInput).toHaveValue(text);
    });
  });
});
