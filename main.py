import logging
from urllib.error import HTTPError, URLError
import urllib.request
import ssl

logging.basicConfig(filename="/tmp/template.log",
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
            response = urllib.request.urlopen(url,timeout=60, context=ctx)
        except HTTPError as error:
            return {
                "error": error
            }

        except URLError as error:
            return {
                "error": error
            }
        return {
            "response": response.url
        }

    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        pass
