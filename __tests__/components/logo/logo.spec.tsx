import { Logo } from "@/components/logo";
import { render, screen } from "@/lib/test-utils";

describe("Logo", () => {
  it("should render the logo component", () => {
    render(<Logo />);

    const link = screen.getByRole("link", { name: /prompts/i });

    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", "/");
  });
});
