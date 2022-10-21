import logging
import socket
from urllib.error import HTTPError, URLError
import urllib.request
import urllib.parse
import ssl
import sys

logging.basicConfig(filename="/tmp/radiyo.log",
                    format='[RadiYo] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.DEBUG) # can be changed to logging.DEBUG for debugging issues
handler = logging.StreamHandler(stream=sys.stdout)
def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    logger.critical("Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback))
sys.excepthook = handle_exception
class Plugin:
    async def fetch(self, url: str, customStation: bool):
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        logger.info(msg=f'requested fetch for {url}')
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36'})
        try:
            response = urllib.request.urlopen(req ,timeout=4, context=ctx)
        except HTTPError as error:
            logger.error(msg=f'HTTP Error: {error.reason} Code: {error.code}')
            return {
                "error": 'HTTP Error: ' + str(error.code) + ' ' + error.reason
            }
        except URLError as error:
            logger.error(msg=f'URL Error: {error.reason}')
            if isinstance(error.reason, socket.timeout):
                return {
                    "error": url + ' timed out, try again later.'
                }
            else:
                return {
                    "error": 'URL Error: ' + error.reason
                }
        except ValueError as error:
            logger.error(msg=f'Value Error: {error.reason}')
            return {
                "error": error.reason
            }
        except socket.timeout as error:
            logger.error(msg=f'Timeout:  {error.reason}')
            return {
                "error": 'Timed out: ' + error.reason
            }
        if not customStation :
            body = response.read().decode('utf-8')
        else:
            body = ''
        obj = {
            "body": body,
            "headers": dict(response.getheaders()),
            "status": response.status
        }
        logger.info(msg=obj)
        return obj
    async def getRedirectUrl(self, url):
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        logger.info(msg=f'requested redirect for {url}')
        try:
            response = urllib.request.urlopen(url,timeout=4, context=ctx)
        except HTTPError as error:
            logger.error(msg=f'HTTP Error: {error.reason} Code: {error.code}')
            return {
                "error": 'HTTP Error: ' + error.code + ' ' + error.reason
            }
        except URLError as error:
            logger.error(msg=f'URL Error: {error.reason}')
            if isinstance(error.reason, socket.timeout):
                return {
                    "error": url + ' timed out, try again later.'
                }
            else:
                return {
                    "error": 'URL Error: ' + error.reason
                }
        except ValueError as error:
            logger.error(msg=f'Value Error: {error.reason}')
            return {
                "error": error.reason
            }
        except socket.timeout as error:
            logger.error(msg=f'Timeout:  {error.reason}')
            return {
                "error": 'Timed out: ' + error.reason
            }
        newUrl = response.url
        response.close()
        logger.info(msg=f'Got redirect {response.url}')
        return {
            "response": newUrl
        }

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        logger.info(msg='Started RadiYo Backend')
        pass
