import { render, screen } from "@/lib/test-utils";

describe("Example test", () => {
  it("should render div", () => {
    render(<div>LanPRD</div>);
    expect(screen.getByText("LanPRD"));
  });
});
