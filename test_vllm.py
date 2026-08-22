import httpx
import sys

def test_connection(url):
    print(f"Testing {url}...")
    try:
        resp = httpx.get(url, timeout=5)
        print(f"Success! Status: {resp.status_code}")
    except Exception as e:
        print(f"Failed! Error: {e}")

if __name__ == "__main__":
    test_connection("http://localhost:8000/v1/models")
    test_connection("http://127.0.0.1:8000/v1/models")
