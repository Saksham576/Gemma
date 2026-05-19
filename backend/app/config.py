from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    google_api_key: str | None = None
    gemma_model: str = "gemma-4-26b-a4b-it"
    use_mock_gemma: bool = True
    max_pages: int = 6


settings = Settings()
