from loguru import logger
import sys

from app.core.config import settings


logger.remove()

logger.add(
    sys.stdout,
    level=settings.LOG_LEVEL,
    colorize=True,
    enqueue=True,
    backtrace=True,
    diagnose=settings.DEBUG,
)

logger.add(
    "logs/app.log",
    rotation="10 MB",
    retention="30 days",
    level=settings.LOG_LEVEL,
    enqueue=True,
)

app_logger = logger