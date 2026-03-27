import { PromptList, type PromptListProps } from "@/components/prompts";
import { render, screen } from "@/lib/test-utils";

function makeSut({ prompts }: PromptListProps) {
  return render(<PromptList prompts={prompts} />);
}

describe("PromptList", () => {
  it("renders correctly", () => {
    const prompts = [
      { id: "1", title: "Prompt 1", content: "Content 1" },
      { id: "2", title: "Prompt 2", content: "Content 2" }
    ];

    makeSut({ prompts });

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(prompts.length);
    expect(screen.getByText("Prompt 1")).toBeInTheDocument();
    expect(screen.getByText("Prompt 2")).toBeInTheDocument();
  });

  it("renders empty state when no prompts are provided", () => {
    makeSut({ prompts: [] });

    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
