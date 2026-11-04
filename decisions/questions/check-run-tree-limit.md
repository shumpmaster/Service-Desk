Ruling: A

Question: questions/check-run-tree-limit.md
Milestone: none (the card fix's own milestone, M4, is still only a proposal in its plan, and the desk's standard "work is built" milestone, Build-2, was skipped)

Question, as put: How should the pipeline's check run get past the desk's large files, before any work reaches it?
Options, as put:
  A. Fix it in the operating model, for the check run's copy only: leave out the design folder's images (no check reads them), let ordinary text files of any size through up to the total limit, both when it is packed and when it is unpacked for the run, and list what was left out, as it already does for links. Every other bundle, and every set of changes a builder returns, keeps today's limits.
     What happens: I file it with the operating model as a lesson and a short plan of its own, after the plan-per-project change you just approved; the model's builders make it, its Reviewer checks it, you merge it, and the desk takes it at its next model update.
     Gain: fixed once, for every project, Model-Lab included, and it stays fixed as the design folder grows; the desk's first-version plan stays in, so the checks that read it still work.
     Cost: it waits behind the plan-per-project change, so it may land after the card fix is ready for its check run; then the card fix waits for it, or you take B for the gap. A check that requires a cited file to exist would fail if a record ever cited a left-out image; none does today, and the run's list of left-out files would show it. Rules out: nothing. Reversible: yes.
  B. Fix it here only: shrink the two screenshots under 1 MB, and raise this project's per-file limit to 4 MB so the first-version plan fits.
     What happens: two pictures change, and one line of the pipeline's limits, in a pull request for you to merge.
     Gain: quick; the card fix's check run can go through as soon as it is merged.
     Cost: the per-file limit is loosened for every bundle and every builder's changes here, not only the check run; the next screenshot over 1 MB needs shrinking too; the 128 MiB total is still reached as the folder grows; and the desk's limits then differ from the operating model's. Rules out: nothing. Reversible: yes.
  C. Wait: rule it when the card fix reaches its check run.
     What happens: nothing now.
     Gain: no work until it is needed.
     Cost: a refused check run and a failure card at that point, then A or B under time pressure. Rules out: nothing. Reversible: yes.
