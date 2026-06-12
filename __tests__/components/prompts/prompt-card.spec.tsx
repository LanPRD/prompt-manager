import { PromptCard, type PromptCardProps } from "@/components/prompts/prompt-card";
import { render, screen } from "@/lib/test-utils";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

function makeSut({ prompt }: PromptCardProps) {
  return render(<PromptCard prompt={prompt} />);
}

describe("PromptCard", () => {
  const user = userEvent.setup();
  const prompt = { id: "123", title: "Test Prompt", content: "This is a test prompt." };

  it("should render the link with the correct href", () => {
    makeSut({ prompt });

    const linkElement = screen.getByRole("link");

    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", `/${prompt.id}`);
  });

  it("should open the dialog to delete the prompt", async () => {
    makeSut({ prompt });

    const deleteButton = screen.getByRole("button", { name: "Remover Prompt" });
    await user.click(deleteButton);

    expect(screen.getByText("Remover Prompt")).toBeInTheDocument();
  });

  it("should remove the prompt and show a success message", async () => {
    makeSut({ prompt });

    const deleteButton = screen.getByRole("button", { name: "Remover Prompt" });

    await user.click(deleteButton);

    await user.click(screen.getByRole("button", { name: "Confirmar remoção" }));

    expect(toast.success).toHaveBeenCalledWith("Prompt removido com sucesso!");
  });
});
