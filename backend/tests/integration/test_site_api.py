import pytest
from httpx import AsyncClient

pytestmark = [
    pytest.mark.integration,
    pytest.mark.usefixtures("_integration_state"),
]


@pytest.mark.asyncio
async def test_public_site_content_available(client: AsyncClient):
    response = await client.get("/api/v1/site/content")

    assert response.status_code == 200
    payload = response.json()
    assert payload["key"] == "main"
    assert payload["home_hero"]["badge"] == "Righteous Rides"
    assert payload["contact_page"]["email"] == "info@righteousrides.com"


@pytest.mark.asyncio
async def test_public_services_available(client: AsyncClient):
    response = await client.get("/api/v1/services/")

    assert response.status_code == 200
    payload = response.json()
    assert len(payload) >= 6
    assert payload[0]["slug"] == "luxury-rentals"
    assert payload[0]["title"] == "Luxury Vehicle Rentals"


@pytest.mark.asyncio
async def test_contact_request_can_be_created(client: AsyncClient):
    response = await client.post(
        "/api/v1/contact-requests/",
        json={
            "full_name": "John Doe",
            "phone": "+1 555 000 1234",
            "email": "john@example.com",
            "service_slug": "window-tint",
            "service_label": "Window Tint",
            "vehicle_type": "Porsche 911",
            "preferred_date": "2026-05-20",
            "message": "Need a quote for ceramic tint.",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["full_name"] == "John Doe"
    assert payload["service_slug"] == "window-tint"
    assert payload["service_label"] == "Window Tint"
    assert payload["vehicle_type"] == "Porsche 911"
