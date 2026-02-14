import { SidebarContent } from "@/components/sidebar/sidebar-content";
import { render, screen } from "@/lib/test-utils";
import userEvent from "@testing-library/user-event";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock
  })
}));

function makeSut() {
  return render(<SidebarContent />);
}

describe("<SidebarContent />", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    pushMock.mockClear();
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
});
