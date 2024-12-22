import logging
import sys

def configure_logging():
    """Configure logging with appropriate levels for different loggers"""
    
    # Root logger configuration
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler(sys.stdout)]
    )

    # Set specific levels for noisy loggers
    logging.getLogger('httpx').setLevel(logging.WARNING)
    logging.getLogger('httpcore').setLevel(logging.WARNING)
    
    # Set custom levels for our loggers
    logging.getLogger('api').setLevel(logging.DEBUG)
    logging.getLogger('models').setLevel(logging.DEBUG)