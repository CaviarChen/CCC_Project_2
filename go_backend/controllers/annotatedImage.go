package controllers

import (
	"bytes"
	"image"
	"image/color"
	"image/jpeg"
	"io"
	"net/http"
	"net/url"

	"github.com/CaviarChen/CCC_Project_2/go_backend/config"
	"github.com/fogleman/gg"
	"github.com/gin-gonic/gin"
	"github.com/leesper/couchdb-golang"
)

func GetAnnotatedImage(c *gin.Context) {
	docID := c.Query("image_url")
	if docID == "" {
		c.AbortWithStatus(403)
		return
	}
	// not sure if this one is thread safe, so use the naive way
	server, err := couchdb.NewServer(config.GetCouchDBUrl())
	if err != nil {
		c.AbortWithError(500, err)
		return
	}
	db, err := server.Get("tweet_image_with_yolo")
	if err != nil {
		c.AbortWithError(500, err)
		return
	}

	doc, err := db.Get(docID, nil)
	if err != nil {
		c.AbortWithError(404, err)
		return
	}
	// does not word due to url encode, so use http request to get the image
	// originImage, err := db.GetAttachment(doc, "small.jpg")
	client := http.Client{}
	res, err := client.Get(config.GetCouchDBUrl() + "/tweet_image_with_yolo/" + url.QueryEscape(docID) + "/small.jpg")
	if err != nil {
		c.AbortWithError(404, err)
		return
	}

	image, err := drawBoundingBox(res.Body, doc["yolo"].([]interface{}))
	if err != nil {
		c.AbortWithError(500, err)
		return
	}
	c.Data(200, "image/jpeg", image)
}

func drawBoundingBox(originImageReader io.Reader, yoloDataList []interface{}) (res []byte, err error) {
	originImage, _, err := image.Decode(originImageReader)
	if err != nil {
		return
	}
	gc := gg.NewContextForImage(originImage)

	err = gc.LoadFontFace("./DejaVuSans.ttf", 22)
	if err != nil {
		return
	}

	for _, yolox := range yoloDataList {
		yolo := yolox.(map[string]interface{})
		t, l, r, b := yolo["top"].(float64), yolo["left"].(float64), yolo["right"].(float64), yolo["bottom"].(float64)
		gc.SetLineWidth(3)
		gc.SetColor(color.RGBA{255, 255, 255, 255})
		drawRect(gc, t, l, r, b)
		gc.SetLineWidth(1)
		gc.SetColor(color.RGBA{1, 21, 40, 255})
		drawRect(gc, t, l, r, b)

		drawText(gc, yolo["class"].(string), l+25, t+25)

	}

	var buf bytes.Buffer
	gc.EncodePNG(&buf)

	finalImage, _, err := image.Decode(&buf)
	if err != nil {
		return
	}

	// log.Println("AAA")

	jpgbuf := new(bytes.Buffer)
	err = jpeg.Encode(jpgbuf, finalImage, nil)
	res = jpgbuf.Bytes()
	return
}

func drawText(gc *gg.Context, s string, tx, ty float64) {
	gc.SetRGB(0, 0, 0)
	n := 6 // "stroke" size
	for dy := -n; dy <= n; dy++ {
		for dx := -n; dx <= n; dx++ {
			if dx*dx+dy*dy >= n*n {
				// give it rounded corners
				continue
			}
			x := tx + float64(dx)
			y := ty + float64(dy)
			gc.DrawStringAnchored(s, x, y, 0, 0)
		}
	}
	gc.SetRGB(1, 1, 1)
	gc.DrawStringAnchored(s, tx, ty, 0, 0)
}

func drawRect(gc *gg.Context, t, l, r, b float64) {
	gc.MoveTo(l, t)
	gc.LineTo(r, t)
	gc.LineTo(r, b)
	gc.LineTo(l, b)
	gc.ClosePath()
	gc.Stroke()
}
