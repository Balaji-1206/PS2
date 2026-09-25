"""FastAPI application entrypoint for the Provenance Layer."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from provenance.api.routes import router as api_router

app = FastAPI(
    title="Provenance Layer",
    description="Governed Content Transformation Platform - Provenance & Audit Trail Service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "error", "message": str(exc.detail)},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"status": "error", "message": str(exc.errors())},
    )


@app.get("/health")
def health_check():
    """Health check endpoint for the Provenance service."""
    return {"status": "ok", "service": "provenance-layer", "version": "1.0.0"}


app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("provenance.main:app", host="0.0.0.0", port=8003, reload=True)
