import copy


__all__ = ('MessagesContextManager', )


class MessagesContextManager(object):
    ALERT_MESSAGE_TYPE = 'alert'
    SUCCESS_MESSAGE_TYPE = 'success'
    ERROR_MESSAGE_TYPE = 'error'
    WARNING_MESSAGE_TYPE = 'warning'
    INFO_MESSAGE_TYPE = 'information'

    def __init__(self):
        self._messages = {
            self.ALERT_MESSAGE_TYPE: [],
            self.SUCCESS_MESSAGE_TYPE: [],
            self.ERROR_MESSAGE_TYPE: [],
            self.WARNING_MESSAGE_TYPE: [],
            self.INFO_MESSAGE_TYPE: [],
            }

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_val:
            message = hasattr(exc_val, 'message') and exc_val.message or 'Unknown error occurred. :('
            self._messages['error'].append(message)

        return True

    def __call__(self, success=None, error=None):
        if not success and not error:
            raise ValueError("Either 'success' or 'error' parameter should be specified!")

        return InnerMessagesContextManager(self, success, error)

    def alert(self, message):
        self._messages[self.ALERT_MESSAGE_TYPE].append(message)

    def success(self, message):
        self._messages[self.SUCCESS_MESSAGE_TYPE].append(message)

    def error(self, message):
        self._messages[self.ERROR_MESSAGE_TYPE].append(message)

    def warning(self, message):
        self._messages[self.WARNING_MESSAGE_TYPE].append(message)

    def info(self, message):
        self._messages[self.INFO_MESSAGE_TYPE].append(message)

    def get_messages(self):
        return copy.deepcopy(self._messages)


class InnerMessagesContextManager(object):

    def __init__(self, parent, success, error):
        self._parent = parent
        self._success = success
        self._error = error

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_val:
            if self._error:
                self._parent.error(self._error)
                return True
            else:
                return self._parent.__exit__(exc_type, exc_val, exc_tb)
        else:
            if self._success:
                self._parent.success(self._success)
                return True
            else:
                return self._parent.__exit__(exc_type, exc_val, exc_tb)
