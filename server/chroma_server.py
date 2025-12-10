import chromadb
from chromadb.config import Settings

# Run ChromaDB server
chroma_server = chromadb.HttpClient(
    settings=Settings(
        chroma_api_impl="chromadb.api.fastapi.FastAPI",
        chroma_server_host="0.0.0.0",
        chroma_server_http_port=8000
    )
)

print("ChromaDB server running on http://localhost:8000")