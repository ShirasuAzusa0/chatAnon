import random
from http import HTTPStatus

import dashscope
from dashscope import Generation
from commons.configs import MODEL_API_NAME, MODEL_API_KEY

class DashScopeAPI:
    def __init__(self):
        dashscope.api_key = MODEL_API_KEY

    # 单轮对话
    def call_with_messages(self, messages):
        response = Generation.call(
            model=MODEL_API_NAME,
            messages=messages,
            seed=random.randint(1, 10000),
            result_format='message'
        )
        if response.status_code == HTTPStatus.OK:
            print(response.output.choices[0]['message']['content'])
        else:
            print('Request id: %s, Status code: %s, error code: %s, error message: %s' % (
                response.request_id, response.status_code, response.code, response.message
            ))

    # 多轮对话
    def multi_round(self, messages):
        response = Generation.call(
            model=MODEL_API_NAME,
            messages=messages,
            result_format='message'
        )
        if response.status_code == HTTPStatus.OK:
            print(response.output.choices[0]['message']['content'])
            messages.append(
                {
                    'role': response.output.choices[0]['message']['role'],
                    'content': response.output.choices[0]['message']['content']
                }
            )
        else:
            print('Request id: %s, Status code: %s, error code: %s, error message: %s' % (
                response.request_id, response.status_code, response.code, response.message
            ))
            messages = messages[:-1]
        return messages

    # 流式输出
    def call_with_stream(self, messages):
        responses = Generation.call(
            model=MODEL_API_NAME,
            messages=messages,
            result_format='message',
            stream=True,
            incremental_output=True
        )
        for response in responses:
            if response.status_code == HTTPStatus.OK:
                print(response.output.choices[0]['message']['content'], end='')
            else:
                print('Request id: %s, Status code: %s, error code: %s, error message: %s' % (
                    response.request_id, response.status_code, response.code, response.message
                ))
                messages = messages[:-1]

if __name__ == '__main__':
    dsapi = DashScopeAPI()
    messages = [
        {'role': 'system', 'content': 'you are a helpful assistant'},
        {'role': 'user', 'content': '你是谁？'},
    ]
    #dsapi.call_with_messages(messages)
    #messages = dsapi.multi_round(messages)
    messages.append({'role': 'user', 'content': '请介绍一下bangdream中的千早爱音'})
    #dsapi.multi_round(messages)
    dsapi.call_with_stream(messages)