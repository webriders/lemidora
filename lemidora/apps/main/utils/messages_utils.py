import copy
from traceback import format_tb
from django.conf import settings


__all__ = ('MessagesContextManager', )


class MessagesContextManager(object):
    ALERT_MESSAGE_TYPE = 'alert'
    SUCCESS_MESSAGE_TYPE = 'success'
    ERROR_MESSAGE_TYPE = 'error'
    WARNING_MESSAGE_TYPE = 'warning'
    INFO_MESSAGE_TYPE = 'information'
    if settings.DEBUG:
        EXCEPTION_MESSAGE_TYPE = '_exception'

    def __init__(self):
        self._messages = {
            self.ALERT_MESSAGE_TYPE: [],
            self.SUCCESS_MESSAGE_TYPE: [],
            self.ERROR_MESSAGE_TYPE: [],
            self.WARNING_MESSAGE_TYPE: [],
            self.INFO_MESSAGE_TYPE: [],
            }
        if settings.DEBUG:
            self._messages[self.EXCEPTION_MESSAGE_TYPE] = []
        self.is_critical_failure = False

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb, critical=False):
        if exc_val:
            self.is_critical_failure = critical
            message = hasattr(exc_val, 'message') and exc_val.message or 'Unknown error occurred. :('
            self._messages['error'].append(message)
            self._add_exception(exc_val, exc_tb, critical)
        return True

    def _add_exception(self, exc_val, exc_tb, critical=False):
        if settings.DEBUG:
            ex_info = dict(message=str(exc_val), traceback=format_tb(exc_tb), is_critical=critical)
            self._messages[self.EXCEPTION_MESSAGE_TYPE].append(ex_info)

    def __call__(self, success=None, error=None, critical=False):
        return InnerMessagesContextManager(self, success, error, critical)

    def alert(self, message):
        self._messages[self.ALERT_MESSAGE_TYPE].append(message)

    def success(self, message):
        self._messages[self.SUCCESS_MESSAGE_TYPE].append(message)

    def error(self, message, critical=False):
        self.is_critical_failure = critical
        self._messages[self.ERROR_MESSAGE_TYPE].append(message)

    def warning(self, message):
        self._messages[self.WARNING_MESSAGE_TYPE].append(message)

    def info(self, message):
        self._messages[self.INFO_MESSAGE_TYPE].append(message)

    def get_messages(self):
        return copy.deepcopy(self._messages)


class InnerMessagesContextManager(object):

    def __init__(self, parent, success, error, critical):
        self._parent = parent
        self._success = success
        self._error = error
        self._critical = critical

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_val:
            if self._error:
                self._parent.error(self._error, self._critical)
                self._parent._add_exception(exc_val, exc_tb, self._critical)
                return True
            else:
                return self._parent.__exit__(exc_type, exc_val, exc_tb, self._critical)
        else:
            if self._success:
                self._parent.success(self._success)
                return True
            else:
                return self._parent.__exit__(exc_type, exc_val, exc_tb)
