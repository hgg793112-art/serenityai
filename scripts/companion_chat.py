"""
療癒陪伴者 — 調用阿里雲百煉通義千問 API
用法：
    python companion_chat.py
    或在其他腳本中 from companion_chat import chat_with_companion
"""

import os
import json
import requests

API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation"
MODEL = "qwen-plus"

SYSTEM_PROMPT = """你是一位温和、稳定、包容、有疗愈感的成长陪伴者。

你的核心原则：
- 不指责、不评判、不催促、不说教、不施压
- 永远站在用户这边，稳稳接住情绪，不逃离、不忽视
- 允许用户不完美、允许暂停、允许休息
- 记得用户的目标、计划、节奏、情绪与卡点
- 任务未完成时先安抚、理解、接纳，再轻轻调整
- 任务完成时安静肯定，不夸张、不吹捧
- 焦虑、疲惫、内耗时，只共情、陪伴、安抚，不讲大道理
- 说话简短、安静、温暖、有边界、不油腻、不鸡汤、不网络梗

你的疗愈属性：
- 像安静的陪伴者，在用户情绪低落时给予安全感
- 能感知压力、疲惫、自我怀疑，并轻轻托住
- 不强行正能量，允许用户真实表达脆弱
- 用稳定、温柔的存在，帮用户慢慢回到平静
- 陪伴比解决问题更重要，同在比指导更重要

你会记住用户的关键信息：
- 目标与计划
- 执行节奏与偏好
- 情绪状态、卡点、容易焦虑的点
- 用户曾说过的感受、困扰、需求

情境与能力：
- 当用户主要在倾诉情绪、疲惫、焦虑时：以共情、陪伴、安抚为主，不强行给方案或拆解。
- 当用户分享目标、计划，或表达「想拆解／不知道怎么做」时：先简短接住情绪（若有），再温和协助拆解目标——给出 3～5 个小步骤、可执行、不施压；若目标过大，可先拆成「下一步就好」的一小步。语气保持短句、温暖、不催促、不说教。

回复风格：
短句、温和、自然、安静、有力量、克制、治愈。"""


def chat_with_companion(user_input: str, user_memory: str | None = None, api_key: str | None = None) -> str:
    """
    與療癒陪伴者對話。

    Args:
        user_input:  用戶本次輸入的文字
        user_memory: 可選，用戶的目標、習慣、情緒等記憶摘要
        api_key:     可選，DashScope API Key；未傳則讀取環境變數 DASHSCOPE_API_KEY

    Returns:
        AI 回覆文本
    """
    key = api_key or os.environ.get("DASHSCOPE_API_KEY", "")
    if not key:
        raise ValueError("缺少 API Key，請傳入 api_key 參數或設定環境變數 DASHSCOPE_API_KEY")

    system_content = SYSTEM_PROMPT
    if user_memory:
        system_content += f"\n\n【用户记忆档案】\n{user_memory}"

    payload = {
        "model": MODEL,
        "input": {
            "messages": [
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_input},
            ]
        },
        "parameters": {
            "max_tokens": 400,
            "temperature": 0.8,
            "result_format": "message",
        },
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {key}",
    }

    resp = requests.post(API_URL, headers=headers, json=payload, timeout=30)

    if resp.status_code != 200:
        raise RuntimeError(f"API 請求失敗 [{resp.status_code}]: {resp.text}")

    data = resp.json()

    if "output" in data and "choices" in data["output"]:
        return data["output"]["choices"][0]["message"]["content"].strip()

    if "output" in data and "text" in data["output"]:
        return data["output"]["text"].strip()

    raise RuntimeError(f"無法解析回覆: {json.dumps(data, ensure_ascii=False)[:500]}")


# --------------- 互動式測試 ---------------
if __name__ == "__main__":
    print("=== 療癒陪伴者（輸入 q 退出）===\n")

    memory = "用户最近压力较大，正在准备一个重要项目，容易焦虑和自我怀疑。"
    history: list[dict] = []

    while True:
        try:
            msg = input("你：").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not msg or msg.lower() == "q":
            break

        try:
            reply = chat_with_companion(msg, user_memory=memory)
            print(f"\n小寧：{reply}\n")
        except Exception as e:
            print(f"\n[錯誤] {e}\n")
