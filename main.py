import logging
import socket
from urllib.error import HTTPError, URLError
import urllib.request
import ssl

logging.basicConfig(filename="/tmp/radiyo.log",
                    format='[RadiYo] %(asctime)s %(levelname)s %(message)s',
                    filemode='w+',
                    force=True)
logger=logging.getLogger()
logger.setLevel(logging.INFO) # can be changed to logging.DEBUG for debugging issues
class Plugin:
    # A normal method. It can be called from JavaScript using call_plugin_function("method_1", argument1, argument2)
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
