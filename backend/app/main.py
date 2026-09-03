from fastapi import FastAPI

app = FastAPI(title="DeepRead API")

@app.get("/health")
def health_check():
    return {"status":"ok"}
