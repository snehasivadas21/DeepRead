from app.agents.synthesis import SynthesisAgent


def test_synthesis_agent(monkeypatch):

    fake_response = (
        "# Research Report\n\n"
        "The evidence indicates that AI healthcare systems "
        "present significant privacy risks."
    )

    def fake_generate_text(system_prompt, user_prompt):
        assert "original research question" in user_prompt.lower()
        assert "privacy risks" in user_prompt.lower()
        assert "security concerns" in user_prompt.lower()

        return fake_response

    monkeypatch.setattr(
        "app.agents.synthesis.generate_text",
        fake_generate_text,
    )

    analyses = [
        (
            "AI healthcare systems process sensitive "
            "patient information, creating privacy risks."
        ),
        (
            "Security concerns arise when unauthorized "
            "users gain access to patient information."
        ),
    ]

    agent = SynthesisAgent()

    result = agent.synthesize(
        question="What are the risks of AI in healthcare?",
        analyses=analyses,
    )

    assert result == fake_response