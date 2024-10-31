import streamlit as st
import pandas as pd
import feedparser
import openai
import sqlite3
from datetime import datetime
import time
import os

# 设置页面
st.set_page_config(page_title="AI 新闻聚合", layout="wide")

# 初始化数据库
def init_db():
    conn = sqlite3.connect('articles.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS articles
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
         title TEXT NOT NULL,
         content TEXT NOT NULL,
         source TEXT NOT NULL,
         url TEXT UNIQUE NOT NULL,
         publish_date DATETIME,
         created_at DATETIME DEFAULT CURRENT_TIMESTAMP)
    ''')
    conn.commit()
    return conn

# RSS 源配置
RSS_SOURCES = [
    {
        "url": "https://towardsdatascience.com/feed",
        "name": "Towards Data Science"
    },
    {
        "url": "https://blogs.microsoft.com/ai/feed/",
        "name": "Microsoft AI"
    },
    # ... 其他源
]

# 文章抓取函数
def fetch_articles():
    for source in RSS_SOURCES:
        feed = feedparser.parse(source["url"])
        for entry in feed.entries:
            # 处理文章...
            pass

# 主界面
def main():
    st.title("AI 新闻聚合")
    
    # 侧边栏设置
    with st.sidebar:
        st.header("管理设置")
        if st.button("手动抓取"):
            fetch_articles()
    
    # 显示文章列表
    conn = init_db()
    articles = pd.read_sql("SELECT * FROM articles ORDER BY created_at DESC", conn)
    
    for _, article in articles.iterrows():
        with st.container():
            st.header(article['title'])
            st.write(article['content'])
            st.write(f"来源: {article['source']}")
            st.write(f"发布时间: {article['publish_date']}")
            st.divider()

if __name__ == "__main__":
    main() 