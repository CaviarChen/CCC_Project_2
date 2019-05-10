import re
word_lst = []


def initialize():
    global word_lst
    fp = open("foodWord.txt", 'r')
    word = fp.readline()
    while word:
        word_lst.append(word.rstrip('\n'))
        word = fp.readline()
    fp.close()


# isGlutonny takes a string text and a list of string hashtags, return keywords in the text and hashtags
def glutonnyWords(text, hashtags):
    text = text.lower()
    keyWord = []
    for w in word_lst:
        isKeyWord = False
        if wordInText(text, w):
            keyWord.append(w)
            isKeyWord = True
        if not isKeyWord:
            for h in hashtags:
                if wordInText(h, w):
                    keyWord.append(w)
                    break
    return keyWord


def wordInText(text, word):
    reg = '(^|[^\w])' + word + '($|[^\w])'
    m = re.search(reg, text)
    if m:
        return True
    return False