import { PromptCard, type PromptCardProps } from "@/components/prompts/prompt-card";
import { render, screen } from "@/lib/test-utils";

function makeSut({ prompt }: PromptCardProps) {
  return render(<PromptCard prompt={prompt} />);
}

describe("PromptCard", () => {
  it("should render the link with the correct href", () => {
    const prompt = { id: "123", title: "Test Prompt", content: "This is a test prompt." };

    makeSut({ prompt });

    const linkElement = screen.getByRole("link");

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", `/${prompt.id}`);
  });
});
