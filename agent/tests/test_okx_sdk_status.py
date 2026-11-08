"""OKX connector status envelope tests."""

from __future__ import annotations

from src.trading.connectors.okx import sdk as okx_sdk


def test_okx_status_reports_connected_runtime_fields(monkeypatch) -> None:
    """A successful OKX verify exposes the fields consumed by /live/status."""
    monkeypatch.setattr(okx_sdk, "okx_available", lambda: True)
    monkeypatch.setattr(
        okx_sdk,
        "get_account_snapshot",
        lambda _cfg: {
            "status": "ok",
            "account": {"total_equity": "123.45"},
        },
    )

    report = okx_sdk.check_status(
        okx_sdk.OKXConfig(api_key="key", api_secret="secret", passphrase="pass")
    )

    assert report["status"] == "ok"
    assert report["configured"] is True
    assert report["credential_source"] == "runtime_file"
    assert report["connection_state"] == "connected"
    assert report["error_code"] is None
    assert report["last_checked_at"]
    assert report["account"]["total_equity"] == "123.45"


def test_okx_status_reports_missing_credentials_as_not_configured(monkeypatch) -> None:
    """Missing OKX credentials should render as not configured, not unknown."""
    monkeypatch.setattr(okx_sdk, "okx_available", lambda: True)

    report = okx_sdk.check_status(okx_sdk.OKXConfig())

    assert report["status"] == "error"
    assert report["configured"] is False
    assert report["connection_state"] == "not_configured"
    assert report["error_code"] == "credentials_missing"


def test_okx_status_reports_sdk_missing_as_error(monkeypatch) -> None:
    """An installed-credential profile with no python-okx package is actionable."""
    monkeypatch.setattr(okx_sdk, "okx_available", lambda: False)

    report = okx_sdk.check_status(
        okx_sdk.OKXConfig(api_key="key", api_secret="secret", passphrase="pass")
    )

    assert report["status"] == "error"
    assert report["configured"] is True
    assert report["connection_state"] == "error"
    assert report["error_code"] == "sdk_missing"


def test_okx_status_reports_broker_snapshot_failure(monkeypatch) -> None:
    """OKX business errors from the account read fail the verify status."""
    monkeypatch.setattr(okx_sdk, "okx_available", lambda: True)
    monkeypatch.setattr(
        okx_sdk,
        "get_account_snapshot",
        lambda _cfg: {
            "status": "error",
            "error": "okx get_account_balance failed: invalid sign",
            "account": {},
        },
    )

    report = okx_sdk.check_status(
        okx_sdk.OKXConfig(api_key="key", api_secret="secret", passphrase="pass")
    )

    assert report["status"] == "error"
    assert report["configured"] is True
    assert report["connection_state"] == "error"
    assert report["error_code"] == "authentication_failed"
