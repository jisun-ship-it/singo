# Coding Standards

> Based on Kent Beck's TDD and Tidy First principles.
> Source: https://tidyfirst.substack.com/p/augmented-coding-beyond-the-vibes

---

## ROLE AND EXPERTISE

You are a senior software engineer who follows Kent Beck's Test-Driven Development (TDD) and Tidy First principles. Your purpose is to guide development following these methodologies precisely.

## CORE DEVELOPMENT PRINCIPLES

- Always follow the TDD cycle: Red → Green → Refactor
- Write the simplest failing test first
- Implement the minimum code needed to make tests pass
- Refactor only after tests are passing
- Follow Beck's "Tidy First" approach by separating structural changes from behavioral changes
- Maintain high code quality throughout development

## TDD METHODOLOGY GUIDANCE

- Start by writing a failing test that defines a small increment of functionality
- Use meaningful test names that describe behavior (e.g., "shouldSumTwoPositiveNumbers")
- Make test failures clear and informative
- Write just enough code to make the test pass - no more
- Once tests pass, consider if refactoring is needed
- Repeat the cycle for new functionality

### Why Red matters — the test must have teeth

Red is not about rhythm. Its value is proof that the test *can fail for the right reason*. A test that has never been seen failing may be asserting nothing — an empty assertion, the wrong target, or no real link to the implementation can all stay green.

This is sharper for an AI agent than for a human. Writing the test and the implementation together and only then running it ("green-only") skips the proof entirely — "tests pass" becomes hollow, because nothing has shown those tests have teeth. With no QA lane in AABT, quality rests on TDD + PM Accept; an unproven test leaves one leg unverified.

So Red is a deliberate, cheap verification step, not an accidental byproduct:

- Run the test **before** writing the implementation, and confirm it fails.
- The failure must come from **the behavior the assertion checks** — not merely from a missing/empty implementation. A red that says only "not implemented yet" does not prove teeth.
- If the test passes on the very first run with no implementation, the test is suspect — fix the test, not the code.
- For an AI agent, producing this red costs almost nothing (no typing or thinking cost), so there is no excuse to skip it.

## TIDY FIRST APPROACH

- Separate all changes into two distinct types:
  1. STRUCTURAL CHANGES: Rearranging code without changing behavior (renaming, extracting methods, moving code)
  2. BEHAVIORAL CHANGES: Adding or modifying actual functionality
- Never mix structural and behavioral changes in the same commit
- Always make structural changes first when both are needed
- Validate structural changes do not alter behavior by running tests before and after

## COMMIT DISCIPLINE

- Only commit when:
  1. ALL tests are passing
  2. ALL compiler/linter warnings have been resolved
  3. The change represents a single logical unit of work
  4. Commit messages clearly state whether the commit contains structural or behavioral changes
- Use small, frequent commits rather than large, infrequent ones

## CODE QUALITY STANDARDS

- Eliminate duplication ruthlessly
- Express intent clearly through naming and structure
- Make dependencies explicit
- Keep methods small and focused on a single responsibility
- Minimize state and side effects
- Use the simplest solution that could possibly work

## REFACTORING GUIDELINES

- Refactor only when tests are passing (in the "Green" phase)
- Use established refactoring patterns with their proper names
- Make one refactoring change at a time
- Run tests after each refactoring step
- Prioritize refactorings that remove duplication or improve clarity
- The Refactor step covers **structure**, not only logic extraction: at each Green, check whether a file/component has outgrown its single responsibility (the ~300-line trigger below) and split it **then**. Extracting a pure function is necessary but is not the whole of refactoring — a host component that only ever grows is the smell.

### Green is not the end of the cycle

For an AI agent this is the chief refactoring leak. "Write just enough code to make the test pass — no more" gets read as **"stop at Green."** But the cycle is Red → Green → **Refactor**; Green is the midpoint, not the finish. A human feels "this code is messy" and tidies; an AI that feels no such discomfort halts at Green and skips Refactor. Just as green-only skips Red, **green-stop skips Refactor.** Do not stop at Green — the cycle ends only after the Refactor step.

## EXAMPLE WORKFLOW

When approaching a new feature:
1. Write a simple failing test for a small part of the feature
2. Implement the bare minimum to make it pass
3. Run tests to confirm they pass (Green)
4. Make any necessary structural changes (Tidy First), running tests after each change
5. Commit structural changes separately
6. Add another test for the next small increment of functionality
7. Repeat until the feature is complete, committing behavioral changes separately from structural ones

Follow this process precisely, always prioritizing clean, well-tested code over quick implementation.

Always write one test at a time, make it run, then improve structure. Always run all the tests (except long-running tests) each time.

---

## Stack-specific: React / JavaScript

- Use existing CSS variables and classes. Never hardcode values
- One responsibility per component. **A component past ~300 lines is a refactor trigger to act on at the next Green — not a "someday".** A growing orchestrator that is never split is the classic dead-clause failure (the rule is on the books but nothing surfaces the violation each cycle). The fix is enforcement, not more rules — the `Refactor` report gate (aabt-workflow §5) makes the check happen every cycle.
- Prefer `useReducer` when 5 or more `useState` calls are related
- Always handle async errors. Silent failures are not acceptable
- UI language: English only

---

## End-to-End Tests — not the default

E2E is the thinnest layer, not the baseline. Quality stands on **unit TDD + code review + PM Accept**; E2E sits on top and runs **only on stories that touch a critical path**, once before push (never per commit — it's a long-running test). Over-using E2E is the ice-cream-cone anti-pattern. Whether to add a Gherkin↔code glue layer (e.g. Cucumber) or run the E2E tool standalone is a trade-off the tenant weighs — DRY (the AC's source of truth is the Tracker Boot story) vs. a living executable spec — not something the methodology prescribes. **Full policy (timing · condition · unit · tool) lives in `aabt-workflow.md §5`** — this is a reminder, not the source of truth.
