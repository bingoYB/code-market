import axios from "axios";

// 兔小巢webhook代理
export default async function handler(req, res) {
  const { id, payload, type } = req.body;
  if (type === "post.created" || type === "reply.created") {
    const { post } = payload;

    // 管理员的评论不通知
    if (post.is_admin) {
      res.status(200).json({ message: "管理员评论，不通知" });
      return;
    }

    const result = {
      secret: "huaban-txc",
      id: post.id,
      nickname: post.nick_name,
      content: post.content,
      created_at: post.created_at,
      updated_at: post.updated_at,
      images: post.images,
    };

    const markdown = [
      "## 兔小巢用户反馈",
      `* 用户昵称：${result.nickname}`,
      `* 评论内容：${result.content}`,
      `* 评论时间：${result.updated_at}`,
      `* 查看详情：[兔小巢查看](https://support.qq.com/product/30852/post/${result.id})`,
    ];

    const webhookResult = await axios("钉钉机器人hook地址", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        msgtype: "markdown",
        markdown: {
          title: "兔小巢用户反馈",
          text: markdown.join("\n"),
        },
      },
    });

    res.status(200).json(webhookResult.data);
  } else {
    res.status(200).json({ message: "未知事件类型" });
  }
}
