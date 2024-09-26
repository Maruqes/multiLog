package main

type MultiLog struct {
}

func (*MultiLog) CreateLog(identifier string) {
	add_tab(identifier, "New log created: "+identifier)
}

func (*MultiLog) Log(identifier string, content string) {
	add_content(identifier, content)
}

func (*MultiLog) Error(identifier string, content string) {
	add_content(identifier, "|ERR|"+content+"|ERR|")
}

func (*MultiLog) Panic(identifier string, content string) {
	add_content(identifier, content)
}

func (*MultiLog) RemoveLog(identifier string) {
	remove_tab(identifier)
}
