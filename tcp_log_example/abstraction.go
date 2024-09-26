package main



func CreateLog(identifier string) {
	add_tab(identifier, "New log created: "+identifier)
}

func Log(identifier string, content string) {
	add_content(identifier, content)
}

func Error(identifier string, content string) {
	add_content(identifier, "|ERR|"+content+"|ERR|")
}

func Panic(identifier string, content string) {
	add_content(identifier, "|ERR|PANIC! PANIC!"+content+"|ERR|")
	add_content(identifier, "|ERR|PANIC! PANIC!"+content+"|ERR|")
	add_content(identifier, "|ERR|PANIC! PANIC!"+content+"|ERR|")
}

func RemoveLog(identifier string) {
	remove_tab(identifier)
}
