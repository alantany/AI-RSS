import streamlit as st
import requests
import json

# 配置后端 API 地址
API_URL = "https://your-backend-api.com"

# 页面设置
st.set_page_config(page_title="AI 新闻聚合", layout="wide")

# 获取文章列表
def get_articles():
    response = requests.get(f"{API_URL}/api/articles")
    return response.json()

# 主界面
def main():
    st.title("AI 新闻聚合")
    
    # 管理面板
    with st.sidebar:
        st.header("管理设置")
        password = st.text_input("管理密码", type="password")
        if st.button("手动抓取"):
            if password:
                response = requests.post(
                    f"{API_URL}/api/admin/crawl",
                    json={"password": password}
                )
                if response.status_code == 200:
                    st.success("抓取成功")
                else:
                    st.error("抓取失败")
    
    # 显示文章列表
    articles = get_articles()
    for article in articles:
        with st.container():
            st.header(article['title'])
            st.write(article['content'])
            st.write(f"来源: {article['source']}")
            st.write(f"发布时间: {article['publishDate']}")
            st.divider()

if __name__ == "__main__":
    main() 