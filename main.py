"""Unified API Gateway for the Governed Content Transformation Platform.
Mounts Extraction, Generation, Dual Verification, and Provenance layers
with full CORS support for the web application frontend.
"""
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

from extraction.api.routes import router as extraction_router
from generation.api.routes import router as generation_router
from dual_verification.api.routes import router as verification_router
from provenance.api.routes import router as provenance_router

app = FastAPI(
    title="Governed Content Transformation Platform",
    description="Unified API Gateway connecting Extraction, Claim Layer, Multi-Channel Generation, Dual Verification, and Provenance.",
    version="1.0.0",
)

# Full CORS support for local development and web frontend
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
    return {
        "status": "ok",
        "platform": "Governed Content Transformation Platform",
        "version": "1.0.0",
        "modules": {
            "extraction": "active",
            "generation": "active",
            "dual_verification": "active",
            "provenance": "active",
        },
    }


# Include all modular routers
app.include_router(extraction_router, tags=["Extraction & Claim Layer"])
app.include_router(generation_router, tags=["Governed Multi-Channel Generation"])
app.include_router(verification_router, tags=["Dual Verification Gates"])
app.include_router(provenance_router, tags=["Provenance & Audit Trail"])

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
